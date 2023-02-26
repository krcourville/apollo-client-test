export type GetPeopleSummaryResponse = {
  __typename: 'Person',
  id: string,
  name: string,
}

export type GetPersonDetail1Response = {
  id: string,
  name: string,
  birthYear: string,
  mass: number,
}

export type Species = {
  name: string,
  classification: string,
}

export type GetPersonDetail2Response = {
  id: string,
  name: string,
  skinColor: string,
  species: Species | null,
}
