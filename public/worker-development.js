/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.js":
/*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("// Custom Service Worker for Push Notifications\nself.addEventListener('push', function(event) {\n    if (event.data) {\n        const data = event.data.json();\n        const options = {\n            body: data.body,\n            icon: data.icon || '/icons/icon-192x192.png',\n            badge: data.badge || '/icons/icon-192x192.png',\n            vibrate: [\n                200,\n                100,\n                200,\n                100,\n                200,\n                100,\n                200\n            ],\n            data: {\n                url: data.url || '/'\n            }\n        };\n        event.waitUntil(self.registration.showNotification(data.title, options));\n    }\n});\nself.addEventListener('notificationclick', function(event) {\n    event.notification.close();\n    event.waitUntil(clients.matchAll({\n        type: 'window',\n        includeUncontrolled: true\n    }).then(function(clientList) {\n        // Check if the window is already open\n        for(let i = 0; i < clientList.length; i++){\n            const client = clientList[i];\n            if (client.url.includes(event.notification.data.url) && 'focus' in client) {\n                return client.focus();\n            }\n        }\n        // If not, open a new window\n        if (clients.openWindow) {\n            return clients.openWindow(event.notification.data.url);\n        }\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsK0NBQStDO0FBQy9DQSxLQUFLQyxnQkFBZ0IsQ0FBQyxRQUFRLFNBQVVDLEtBQUs7SUFDekMsSUFBSUEsTUFBTUMsSUFBSSxFQUFFO1FBQ1osTUFBTUEsT0FBT0QsTUFBTUMsSUFBSSxDQUFDQyxJQUFJO1FBQzVCLE1BQU1DLFVBQVU7WUFDWkMsTUFBTUgsS0FBS0csSUFBSTtZQUNmQyxNQUFNSixLQUFLSSxJQUFJLElBQUk7WUFDbkJDLE9BQU9MLEtBQUtLLEtBQUssSUFBSTtZQUNyQkMsU0FBUztnQkFBQztnQkFBSztnQkFBSztnQkFBSztnQkFBSztnQkFBSztnQkFBSzthQUFJO1lBQzVDTixNQUFNO2dCQUNGTyxLQUFLUCxLQUFLTyxHQUFHLElBQUk7WUFDckI7UUFDSjtRQUVBUixNQUFNUyxTQUFTLENBQ1hYLEtBQUtZLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQUNWLEtBQUtXLEtBQUssRUFBRVQ7SUFFdkQ7QUFDSjtBQUVBTCxLQUFLQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsU0FBVUMsS0FBSztJQUN0REEsTUFBTWEsWUFBWSxDQUFDQyxLQUFLO0lBQ3hCZCxNQUFNUyxTQUFTLENBQ1hNLFFBQVFDLFFBQVEsQ0FBQztRQUFFQyxNQUFNO1FBQVVDLHFCQUFxQjtJQUFLLEdBQUdDLElBQUksQ0FBQyxTQUFVQyxVQUFVO1FBQ3JGLHNDQUFzQztRQUN0QyxJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSUQsV0FBV0UsTUFBTSxFQUFFRCxJQUFLO1lBQ3hDLE1BQU1FLFNBQVNILFVBQVUsQ0FBQ0MsRUFBRTtZQUM1QixJQUFJRSxPQUFPZixHQUFHLENBQUNnQixRQUFRLENBQUN4QixNQUFNYSxZQUFZLENBQUNaLElBQUksQ0FBQ08sR0FBRyxLQUFLLFdBQVdlLFFBQVE7Z0JBQ3ZFLE9BQU9BLE9BQU9FLEtBQUs7WUFDdkI7UUFDSjtRQUNBLDRCQUE0QjtRQUM1QixJQUFJVixRQUFRVyxVQUFVLEVBQUU7WUFDcEIsT0FBT1gsUUFBUVcsVUFBVSxDQUFDMUIsTUFBTWEsWUFBWSxDQUFDWixJQUFJLENBQUNPLEdBQUc7UUFDekQ7SUFDSjtBQUVSIiwic291cmNlcyI6WyJEOlxcYXBsaWNhY2lvbmVzLWlhXFxuZXh0LXRhc2tcXHdvcmtlclxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ3VzdG9tIFNlcnZpY2UgV29ya2VyIGZvciBQdXNoIE5vdGlmaWNhdGlvbnNcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdwdXNoJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQuZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBib2R5OiBkYXRhLmJvZHksXHJcbiAgICAgICAgICAgIGljb246IGRhdGEuaWNvbiB8fCAnL2ljb25zL2ljb24tMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBiYWRnZTogZGF0YS5iYWRnZSB8fCAnL2ljb25zL2ljb24tMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICB2aWJyYXRlOiBbMjAwLCAxMDAsIDIwMCwgMTAwLCAyMDAsIDEwMCwgMjAwXSxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBkYXRhLnVybCB8fCAnLydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGV2ZW50LndhaXRVbnRpbChcclxuICAgICAgICAgICAgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihkYXRhLnRpdGxlLCBvcHRpb25zKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdub3RpZmljYXRpb25jbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQubm90aWZpY2F0aW9uLmNsb3NlKCk7XHJcbiAgICBldmVudC53YWl0VW50aWwoXHJcbiAgICAgICAgY2xpZW50cy5tYXRjaEFsbCh7IHR5cGU6ICd3aW5kb3cnLCBpbmNsdWRlVW5jb250cm9sbGVkOiB0cnVlIH0pLnRoZW4oZnVuY3Rpb24gKGNsaWVudExpc3QpIHtcclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHdpbmRvdyBpcyBhbHJlYWR5IG9wZW5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGllbnRMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBjbGllbnRMaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsaWVudC51cmwuaW5jbHVkZXMoZXZlbnQubm90aWZpY2F0aW9uLmRhdGEudXJsKSAmJiAnZm9jdXMnIGluIGNsaWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBJZiBub3QsIG9wZW4gYSBuZXcgd2luZG93XHJcbiAgICAgICAgICAgIGlmIChjbGllbnRzLm9wZW5XaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnRzLm9wZW5XaW5kb3coZXZlbnQubm90aWZpY2F0aW9uLmRhdGEudXJsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICApO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbInNlbGYiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJkYXRhIiwianNvbiIsIm9wdGlvbnMiLCJib2R5IiwiaWNvbiIsImJhZGdlIiwidmlicmF0ZSIsInVybCIsIndhaXRVbnRpbCIsInJlZ2lzdHJhdGlvbiIsInNob3dOb3RpZmljYXRpb24iLCJ0aXRsZSIsIm5vdGlmaWNhdGlvbiIsImNsb3NlIiwiY2xpZW50cyIsIm1hdGNoQWxsIiwidHlwZSIsImluY2x1ZGVVbmNvbnRyb2xsZWQiLCJ0aGVuIiwiY2xpZW50TGlzdCIsImkiLCJsZW5ndGgiLCJjbGllbnQiLCJpbmNsdWRlcyIsImZvY3VzIiwib3BlbldpbmRvdyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./worker/index.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.js");
/******/ 	
/******/ })()
;