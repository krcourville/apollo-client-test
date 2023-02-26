import { Component, h, State, Watch } from '@stencil/core';
import { SwapiClient } from '../../swapi/swapi-client';
import { GetPeopleSummaryResponse, GetPersonDetail1Response, GetPersonDetail2Response } from '../../swapi/types';
import { PeopleSelector } from './people-selector';

const swapi = new SwapiClient();

const json = (o: any) => (o == null ? '' : JSON.stringify(o, null, 2));

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  @State() people: GetPeopleSummaryResponse[] = [];
  @State() selectedId: string = null;
  @State() personDetail1: GetPersonDetail1Response = null;
  @State() personDetail2: GetPersonDetail2Response = null;

  async componentDidLoad() {
    this.people = await swapi.getPeopleSummary();
  }

  @Watch('selectedId')
  async onSelectedIdChange(id: string) {
    const [personDetail1, personDetail2] = await Promise.all([swapi.getPersonDetail1(id), swapi.getPersonDetail2(id)]);
    this.personDetail1 = personDetail1;
    this.personDetail2 = personDetail2;
  }

  render() {
    return (
      <div>
        <header>
          <h1>Stencil App Starter</h1>
        </header>

        <main>
          <h2>Select Person:</h2>
          <PeopleSelector selectedId={this.selectedId} items={this.people} onPersonSelect={id => (this.selectedId = id)} />

          <h2>Person Detail 1</h2>
          <pre>{json(this.personDetail1)}</pre>

          <h2>Person Detail 2</h2>
          <pre>{json(this.personDetail2)}</pre>
        </main>
      </div>
    );
  }
}
