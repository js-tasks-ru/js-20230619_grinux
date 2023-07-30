export default function () {

  return new URL (import.meta.url).pathname.split('/').slice(0,-1).join('/');

}