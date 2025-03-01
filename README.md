# Prolog Tester

Have you ever found yourself in a situation where you would like to have test 
support for your Prolog code? 
Me neither, but as I had to use Prolog because of university, I needed a better way
of writing and controlling my Prolog tests than with the CLI.

A VS Code extension which adds support for Prolog unit tests to the VS Code test explorer.

## Features

- Scans every *.pl and *.plt file in your workspace for tests and adds these to the VS Code test explorer.
- You can execute all tests in a given file or only specific test cases.
- Displays errors directly at the corresponding test case.
## Requirements

- Developed and tested under Windows 11. 
- Use SWIP-Prolog.
- Make sure your swipl.exe is added to your path variable.
- In order to get the tests recognized, they need to be in a *.pl or *.plt file.
- This extension relies on the plunit libary for Prolog. (Should come preinstalled with SWIP-Prolog)

## How to use
- Create a separate file `yourFileName.pl` for your predicate you want to test.
- Start the file of by importing all required libraries.
- Then consult the file with the predicate you want to test.
- Declare the beginning of your tests with `:- begin_tests(nameYourTestSuit).`.
- End the test region by inserting `:- end_tests(nameYourTestSuit).`.
- In this region you can now create your test cases like this:
    ```
    test(firstTestCase) :-
        myPredicateToTest(InParams, Out),
        assertion(Out == [1,2,3]).
    ```
- You can name you test cases two ways:
    - Either a name WITHOUT quotes beginning with lowercase like this: `test(testName) :- ...`.
    - Or numbering them like this: `test(0) :- ...`.

Here is a full example:
```plaintext
:- use_module(library(plunit)).

:- consult('..\\myPredicate.pl').

:- begin_tests(myPredicateSimpleTest).

test(firstTest) :- 
    predicateOne([3,2,1], Out),
    assertion(Out == [1,2,3]).

:- end_tests(myPredicateSimpleTest).
```
## Extension Settings

Currently there are no settings.

## Known Issues

The parsing of the TestResults is very crappy and may break in the future or with different prolog versions as the test-output changes over time/versions.

## Planed

- Add a setting to add custom file extensions.
- Add a setting to manually point to the SWIPL executable.

## Release Notes


### 1.1.1
- [Stephan van der Feest](https://github.com/sabvdf) fixed [two bugs](https://github.com/BennetKrz/prolog-tester/pull/1).
### 1.1.0
- If a file containing tests is renamed or deleted inside VS Code, these tests will now be automatically removed from the test explorer.
- Added a timeout after which a test automatically fails. Currently, this is 20 seconds. In the future, I want to add a setting to manually set the value.
- The naming of the tests has slightly changed, as it became apparent that executing single test cases does not seem to work if named with quotes. This has been fixed, so please make sure to use the new naming schema.
- Fixed some typos in the README.
### 1.0.0

- Initial release of this Extension...