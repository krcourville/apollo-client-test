import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client/core';
import { GetPeopleSummaryResponse } from './types';

const URL = 'https://swapi-graphql.netlify.app/.netlify/functions/index';

export type FragmentId = "PersonDetail1" | "PersonDetail2"

export const Fragments = new Map<FragmentId, string>([
  [
    "PersonDetail1",
    `
      fragment PersonDetail1 on Person {
        id
        name
        birthYear
        mass
      }
    `
  ],
  [
    "PersonDetail2",
    `
      fragment PersonDetail2 on Person {
        id
        name
        species {
          name
          classification
        }
      }
    `
  ],
]);

const FRAGMENT_Q_WAIT_TIME_MS = 50;

type FragmentQueryBufferItem = {
  name: string,
  fragment: string,
}

type FragmentQueryBufferHandler = (items: FragmentQueryBufferItem[]) => Promise<any>;

type FragmentQueryBufferOptions = {
  waitTime: number,
}

class Future<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  promise: Promise<T> = null;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class FragmentQueryBuffer {
  private items: FragmentQueryBufferItem[] = [];
  private waitHandle: NodeJS.Timeout = null;
  private future: Future<FragmentQueryBufferItem[]> = null;

  constructor(private options: FragmentQueryBufferOptions) { }

  public request(item: FragmentQueryBufferItem, handler: FragmentQueryBufferHandler): Promise<any> {
    if (this.future == null) {
      this.future = new Future<FragmentQueryBufferItem[]>();
    }
    this.items.push(item);

    if (this.waitHandle != null) {
      clearTimeout(this.waitHandle);
      this.waitHandle = null;
    }

    this.waitHandle = setTimeout(async () => {
      clearTimeout(this.waitHandle);
      this.waitHandle = null;

      const res = await handler(this.items.slice());
      this.future.resolve(res);

      this.items.length = 0;
      this.future = null;
    }, this.options.waitTime);

    return this.future.promise;
  }
}

export class SwapiClient {
  private client: ApolloClient<NormalizedCacheObject>;
  private getPersonDetailBuffer: FragmentQueryBuffer;

  constructor() {
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      uri: URL,
    });
    this.getPersonDetailBuffer = new FragmentQueryBuffer({
      waitTime: FRAGMENT_Q_WAIT_TIME_MS
    });
  }

  public async getPeopleSummary(): Promise<GetPeopleSummaryResponse[]> {
    const res = await this.client
      .query({
        query: gql`
          query Query {
            allPeople(first: 10) {
              people {
                id
                name
              }
            }
          }`
      });
    return res.data.allPeople.people;
  }

  public async getPersonDetailWithFragment<TResponse>(personId: string, fragmentId: FragmentId): Promise<TResponse> {
    const res = await this.getPersonDetailBuffer.request(
      {
        name: fragmentId,
        fragment: Fragments.get(fragmentId),
      },
      async (buffer) => {
        const definedFragments = buffer.map(b => b.fragment);
        const referencedFragments = buffer.map(b => `...${b.name}`);

        const query = gql`
          ${definedFragments}
          query Query($personId: ID) {
            person(id: $personId) {
              ${referencedFragments}
            }
          }
        `;
        const res = await this.client.query({
          query,
          variables: {
            personId
          }
        });
        return res.data.person;
      });

    return res;
  }
}
