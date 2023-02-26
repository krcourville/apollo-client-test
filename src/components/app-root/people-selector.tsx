import { FunctionalComponent, h } from '@stencil/core';
import { GetPeopleSummaryResponse } from '../../swapi/types';

export type PeopleSelectorProps = {
  selectedId: string | undefined;
  items: GetPeopleSummaryResponse[];
  onPersonSelect: (id: string) => void;
};

const itemClass = (selectedId: string, currentId: string) => ['list-item', selectedId === currentId ? 'selected' : ''].join(' ');

export const PeopleSelector: FunctionalComponent<PeopleSelectorProps> = ({ items, onPersonSelect, selectedId }) => {
  return (
    <ul class="list">
      {items.map(item => (
        <li class={itemClass(selectedId, item.id)}>
          <button type="button" class="list-action" onClick={() => onPersonSelect(item.id)}>
            Select
          </button>
          <span class="list-label">{item.name}</span>
        </li>
      ))}
    </ul>
  );
};
