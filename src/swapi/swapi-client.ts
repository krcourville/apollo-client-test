import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client/core';
// import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { GetPeopleSummaryResponse, GetPersonDetail1Response, GetPersonDetail2Response } from './types';

const URL = 'https://swapi-graphql.netlify.app/.netlify/functions/index';

const PERSON_DETAIL1_FRAGMENT = gql`
  fragment PersonDetail1Fragment on Person {
    id
    name
    birthYear
    mass
  }
`;

const PERSON_DETAIL2_FRAGMENT = gql`
  fragment PersonDetail2Fragment on Person {
    id
    name
    species {
      name
      classification
    }
  }
`;

export class SwapiClient {
  client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    // const link = new BatchHttpLink({
    //   uri: URL,
    //   batchMax: 5,
    //   batchInterval: 20
    // });
    this.client = new ApolloClient({
      uri: URL,
      cache: new InMemoryCache(),
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

  public async getPersonDetail1(personId: string): Promise<GetPersonDetail1Response> {

    const res = await this.client
      .query({
        query: gql`
          ${PERSON_DETAIL1_FRAGMENT}
          query Query($personId: ID) {
            person(id: $personId) {
              ...PersonDetail1Fragment
            }
          }`,
        variables: {
          personId
        }
      });
    return res.data.person;
  }

  public async getPersonDetail2(personId: string): Promise<GetPersonDetail2Response> {
    const res = await this.client
      .query({
        query: gql`
          ${PERSON_DETAIL2_FRAGMENT}
          query Query($personId: ID) {
            person(id: $personId) {
              ...PersonDetail2Fragment
            }
          }
        `,
        variables: {
          personId
        }
      });
    console.log('RES', res.data.person);
    return res.data.person;
  }


}
