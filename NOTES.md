# Notes
- @UseMiddleware() 7/9/21(Solved)
	- When sending request to 'createCommunity' mutation I got this error:
		"Service with \"MaybeConstructable<isAuthenticated>\" identifier
		 was not found in the container. Register it before usage via
		 explicitly calling the \"Container.set\" function or using the \"@Service()\" decorator."
		 fixed it by changing tsconfig "target" from "es5" to "es6".

