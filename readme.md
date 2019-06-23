# Fmait 
`Fmait` is a function that allows easy transformations over arrays, asynchronously. It
provides one additional level of abstraction from `async`/`await`, and makes writing, clean,
concurrent code a piece of cake.
# Installation
To install:
```sh
npm install fmait
```
To import:
```js
const fmait = require("fmait");
```
Or, if you are using ES6 modules:
```js
import fmait from "fmait";
```
# Use
Let's use a very real situation as an example. You want to create a function that takes a list
of Github users, and fins the first follower of each of those users. It wouldn't be hard to 
write such a program with `async`/`await`, or even promise chaining. However, `fmait` makes writing such a program possible without littering your code with temporary variables and messy
`Promise.all` calls. Let's start by creating the initial function:
```js
function getFirstFollowers(users){

}
```
In order to use `async`/`await`, which `fmait` uses internally and needs to be used externally, make all your functions that use `fmait` `async`.
```js
async function getFirstFollowers(users){

}
```
`fmait` is an `async` function, so we can return the result of calling it without `await`, because the promise it returns can be `await`ed in another async function:
```js
async function getFirstFollowers(users){
    return fmait(/*The magic happens here*/);
}
```
`fmait` takes a array of callbacks, used as transformations, as its first parameter, which we'll go over later. For the second parameter, `fmait` takes an array that the transformations from the first parameter will be applied to:
```js
async function getFirstFollowers(users){
    return fmait([/*transformation callbacks go here*/], users);
}
```
First, the list of users need to be transformed into API urls. Github has a wonderful API that we can use:
```js
async function getFirstFollowers(users){
    return fmait([
        x => "https://api.github.com/users/" + x
    ], users);
}
```
As one can see, this looks a bit like a `.map` call. We have a callback function that is mapped over the array. However, behind the scenes, `fmait` converts the return value of that
callback function to a promise using `Promise.resolve`, which it then `await`s. 

You may be worried that `fmait` will individually `await` each item of the array. Good news: It dosen't! It uses `Promise.all` to `await` all of the items of the array concurrently. Now, we need to `fetch` the data from the url. You may be tempted to create an `async` callback function, but your callback function needs to return a `Promise`:
```js
async function getFirstFollowers(users){
    return fmait([
        x => "https://api.github.com/users/" + x,
        x => fetch(x), // The result of the last callback is passed to the next. This creates a pipeline of functions
        x => x.json() // The promise is resolved behind the scenes with await, allowing you to continue to the next transformation as if you had awaited the promise manually
    ], users);
}
```
So, the general layout of the `fmait` function is:

# Step 1:
Map the first transformation in the list of callbacks over the array. If the callback dosen't 
return a promise, make it return one with `Promise.resolve`.
# Step 2:
Make the entire array of promises concurrent in execution with `Promise.all`, `await` that, and replace the old array with the array of results.
# Step 3:
If all the transformations have been applied, return from the function. Otherwise, using the next transformation in the list of callbacks, repeat.

So, to complete the function:
```js
async function getFirstFollowers(users){
    return fmait([
        x => "https://api.github.com/users/" + x,
        x => fetch(x),
        x => x.json(),
        x => fetch(x.followers_url),
        x => x.json(),
        x => x[0],
        x => x.login
    ], users);
}
```
And that's how to use `fmait`.

Enjoy!
