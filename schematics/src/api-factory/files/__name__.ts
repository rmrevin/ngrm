import { HttpClient } from '@angular/common/http';
import { ApiRequestSubject } from '@app/common/api-request.subject';
import { map } from 'rxjs/operators';

export interface Request
{
}

// export type Response = any;
export interface Response
{
}

// tslint:disable-next-line:typedef
export function factory (http: HttpClient) {
  return new ApiRequestSubject<Request, Response>(
    (request: Request) => http.get<Response>('').pipe(
      map(response => response),
    ),
  );
}
