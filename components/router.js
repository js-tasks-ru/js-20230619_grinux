export default class Router {

  currentRoute = null;

  constructor(routes, defaultRoute, container) {
    if (!container || !routes || routes.length === 0 || !defaultRoute)
      throw new Error('Router: wrong params');

    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.container = container;

    this.createEventListeners();

    this.route = this.route.bind(this);
    return this.route;
  }

  route(path, push = true) {
    let route = this.findRoute(path);
    if (!route) {
      route = this.defaultRoute;
      path = route.path;
    }

    if (this.currentRoute) {
      this.currentRoute.component.detach();
      if (push)
        window.history.pushState(null, null, path);
    }
    else
      window.history.replaceState(null, null, path);

    if (!route.component)
      route.component = new route.createComponent();
    this.container.append(route.component.render(this.getSubpath(path)));
    this.currentRoute = route;
  }

  getSubpath(path) {

    return path.split('/').slice(2).join('/');
  }

  findRoute(path) {

    let foundRoute = null;

    for (const route of this.routes) {
      if (route.serveSubPath && path.startsWith(route.path))
        foundRoute = route;
      else if (route.path === path) 
        foundRoute = route;
    }
    return foundRoute;
  }

  onDocumentClick = event => {
    if (event.target.closest('a')) {
      event.preventDefault();
      this.route(event.target.closest('a').pathname);
    }
  }

  handleNavigationButtons = () => {
    this.route(window.location.pathname, false);
  } 

  createEventListeners() {
    document.addEventListener('click', this.onDocumentClick);
    window.addEventListener("popstate", this.handleNavigationButtons);
  }

  removeEventListeners() {
    document.removeEventListener('click', this.onDocumentClick);
    window.removeEventListener("popstate", this.handleNavigationButtons);
  }

  destroy() {
    this.removeEventListeners();
  }

}