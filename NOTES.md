# Notes
	- Problems
			- @UseMiddleware() 7/9/21(Solved)
				- When sending request to 'createCommunity' mutation I got this error:
					"Service with \"MaybeConstructable<isAuthenticated>\" identifier
					 was not found in the container. Register it before usage via
					 explicitly calling the \"Container.set\" function or using the \"@Service()\" decorator."
					 fixed it by changing tsconfig "target" from "es5" to "es6".
					 source: tajpouria answer on https://github.com/MichalLytek/type-graphql/issues/433

			- Migrations
				- error when attempting to generate after creating communities
					error: metadata for 'User#comunities'
	
			- Test
				- when I first run the tests, I find that integration tests fails sometimes.
					errors include: testUtils is undefined and session cookie being undefined
					


