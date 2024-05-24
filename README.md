# prolog-tester README

This extention is adds the ability to execute and watch your Prolog Testfiles.

## Features

Automatically scans *.pl and *.plt files for tests and adds these to the VSCode Test Explorer.
You can execute all tests in a given file or specific test cases only.
It showes you the complete error at the test.
## Requirements

Developed and tested under windows. Use SWIP-Prolog. Make sure your swipl.exe is added to your path variable.
So that the files will be recognized they need to have the .pl or .plt file ending.

This extension relies on the plunit libary for prolog.
It scans files for ":- begin_tests({your Test Suit name here})."
A test Suit should end with "end_tests({your Test Suit name here})."
Between you can add as much test cases as you like by writing: 
"test({A Name for each test Case}) :-
    yourPredicateToTest(InValue, Out),
    assertion(Out == [1,2,3,4])."

Dont put a :- halt instruction at the end of your test-files.

## Extension Settings

At this point there are no settings.

## Known Issues

The parsing of the TestResults is very crappy and may break in the future or with different prolog versions as the test-output changes over time...

## Release Notes

This is my first extension and made in a hurry, as i need this extension for a university-project...

### 1.0.0

Initial release of this Extension - barly works by now