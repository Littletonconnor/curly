/**
 * Exit code for HTTP errors (4xx/5xx) when --fail is used.
 * Matches curl's exit code 22 for HTTP page not retrieved.
 * @see https://curl.se/docs/manpage.html#EXIT-CODES
 */
export const HTTP_ERROR_EXIT_CODE = 22

export const CONTENT_TYPES = {
  text: ['text/html', 'application/xml', 'application/xhtml+xml'],
  json: ['application/json'],
  formData: ['multipart/form-data'],
  arrayBuffer: ['image/', 'video/', 'application/octet-stream'],
}
