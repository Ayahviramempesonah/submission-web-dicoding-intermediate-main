// // function extractPathnameSegments(path) {
// //   const splitUrl = path.split('/');

// //   return {
// //     resource: splitUrl[1] || null,
// //     id: splitUrl[2] || null,
// //   };
// // }

// // function constructRouteFromSegments(pathSegments) {
// //   let pathname = '';

// //   if (pathSegments.resource) {
// //     pathname = pathname.concat(`/${pathSegments.resource}`);
// //   }

// //   if (pathSegments.id) {
// //     pathname = pathname.concat('/:id');
// //   }

// //   return pathname || '/';
// // }

// // export function getActivePathname() {
// //   return location.hash.replace('#', '') || '/';
// // }

// // // export function getActiveRoute() {
// // //   const pathname = getActivePathname();
// // //   const urlSegments = extractPathnameSegments(pathname);
// // //   return constructRouteFromSegments(urlSegments);
// // // }

// // // getActiveRoute percobaan

// // export function getActiveRoute(activePathname, routes) {
// //   // Cari route yang cocok dengan activePathname
// //   for (const route in routes) {
// //     const routeRegex = new RegExp(`^${route.replace(':id', '[^/]+')}$`);
// //     if (routeRegex.test(activePathname)) {
// //       return route;
// //     }
// //   }

// //   // Jika tidak ada route yang cocok, kembalikan '/'
// //   return '/';
// // }

// // export function parseActivePathname() {
// //   const pathname = getActivePathname();
// //   return extractPathnameSegments(pathname);
// // }

// // export function getRoute(pathname) {
// //   const urlSegments = extractPathnameSegments(pathname);
// //   return constructRouteFromSegments(urlSegments);
// // }

// // export function parsePathname(pathname) {
// //   return extractPathnameSegments(pathname);
// // }

// // start

// function extractPathnameSegments(path) {
//   const splitUrl = path.split('/');

//   return {
//     resource: splitUrl[1] || null,
//     id: splitUrl[2] || null,
//   };
// }

// export function getActivePathname() {
//   return location.hash.replace('#', '') || '/';
// }

// export function getActiveRoute(activePathname, routes) {
//   for (const route in routes) {
//     const routeRegex = new RegExp(`^${route.replace(':id', '[^/]+')}$`);
//     if (routeRegex.test(activePathname)) {
//       return route;
//     }
//   }
//   return '/';
// }

// reset
function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
