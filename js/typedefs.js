// @flow
export type Card = {
  name: string,
  numInDeck: number,
  numRequired: number,
};

export type Data = {
  deckSize: number,
  handSize: number,
  cards: Card[],
};

export type Chance = {
  percent: number,
  experimental: boolean,
};
