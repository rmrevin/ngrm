import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpRequestStage, HttpRequestState } from '../http-request.subject';

export function onStage<S> (stage: HttpRequestStage) {
  return (source: Observable<HttpRequestState<S>>) => source.pipe(filter(state => state.stage === stage));
}
