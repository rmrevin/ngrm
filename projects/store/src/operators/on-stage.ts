import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RemoteStateData, RemoteStateStage } from '../shared';

export function onStage<S> (stage: RemoteStateStage) {
  return (source: Observable<RemoteStateData<S>>) => source.pipe(filter(state => state.stage === stage));
}
