import { HttpContextToken } from '@angular/common/http';

// When set to true on a request's HttpContext, the SpinnerInterceptor will not show the global spinner
export const SKIP_SPINNER = new HttpContextToken<boolean>(() => false);
