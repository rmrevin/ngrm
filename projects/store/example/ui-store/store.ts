import { Injectable } from '@angular/core';
import { NgrmStore } from '@ngrm/store';
import effects from './effects';
import reducers from './reducers';

export interface UiStoreStateData
{
  ready: boolean;
  inProgress: boolean;
  error: string | boolean | null;
  message: string | null;
}

function createDefaultState (): UiStoreStateData {
  return {
    ready: false,
    inProgress: true,
    error: null,
    message: null,
  };
}

@Injectable()
export class UiStore extends NgrmStore<UiStoreStateData>
{
  constructor () {
    super(createDefaultState(), reducers, effects);
  }
}
