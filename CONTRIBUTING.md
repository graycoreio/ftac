# Contributing to FTAC

We would love for you to contribute to FTAC and help make it even better than it is
today! As a contributor, here are the guidelines we would like you to follow:

 - [Code of Conduct](#coc)
 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)

## <a name="coc"></a> Code of Conduct
Help us keep FTAC open and inclusive. Please read and follow our [Code of Conduct][coc].

## <a name="question"></a> Got a Question or Problem?

Do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests. Open a [discussion][discussions] instead, so the answer stays available for the next person with the same question.

If you would like to chat about the question in real-time, you can reach out via [our discord server][discord].

## <a name="issue"></a> Found a Bug?
If you find a bug in the source code, you can help us by
[submitting an issue](#submit-issue) to our [GitHub Repository][github]. Even better, you can
[submit a Pull Request](#submit-pr) with a fix.

## <a name="feature"></a> Missing a Feature?
You can *request* a new feature by [submitting an issue](#submit-issue) to our GitHub
Repository. If you would like to *implement* a new feature, please submit an issue with
a proposal for your work first, to be sure that we can use it.
Please consider what kind of change it is:

* For a **Major Feature**, first open an issue and outline your proposal so that it can be
discussed. This will also allow us to better coordinate our efforts, prevent duplication of work,
and help you to craft the change so that it is successfully accepted into the project.
* **Small Features** can be crafted and directly [submitted as a Pull Request](#submit-pr).

A new `fabric/<name>` action, a new Copy source or sink, or a new expression helper
is usually a small feature: one module and one spec; the actions reference on the docs site is generated from the module.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker, maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.

We want to fix all the issues as soon as possible, but before fixing a bug we need to reproduce and confirm it. In order to reproduce bugs, we will systematically ask you to provide a minimal reproduction: the smallest `*-pipeline.yaml` (or `build.ts`) that shows the problem, the JSON FTAC generated for it, and the JSON you expected. The [hello example][hello] is a good starting point to cut down from. Having a reproducible scenario gives us a wealth of important information without going back & forth to you with additional questions like:

- the FTAC commit used
- the Node version
- and most importantly - a use-case that fails

Interestingly, users often find the problem themselves while preparing a minimal reproduction. We understand that sometimes it might be hard to extract the essential bits from a larger pipeline, but we really need to isolate the problem before we can fix it. If the pipeline contains connection ids or queries you can't share, swap them for placeholders; the compiler doesn't care what they are.

Unfortunately, we are not able to investigate / fix bugs without a minimal reproduction, so if we don't hear back from you we are going to close an issue that doesn't have enough info to be reproduced.

You can file new issues by filling out our [new issue form](https://github.com/graycoreio/ftac/issues/new).


### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/graycoreio/ftac/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
1. Fork the [graycoreio/ftac](https://github.com/graycoreio/ftac) repo.
1. Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch main
     ```

1. Create your patch, **including appropriate test cases**.
1. Follow our [Coding Rules](#rules).
1. Run the full test suite, as described in the [developer documentation][dev-doc],
  and ensure that all tests pass. That includes `check`: the JSON of every
  example pipeline must be committed in sync with its source, or CI will fail.
1. Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.

     ```shell
     git commit -a
     ```
    Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

1. Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

1. In GitHub, send a pull request to `ftac:main`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the FTAC test suites to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase main -i
    git push -f
    ```
  * Note: don't squash your branch until after the reviewers comment "lgtm", so they don't need to re-review your entire branch every commit.

### <a name="ai-guidelines"></a> AI Submission Guidelines

> [!CAUTION]
> Please read this carefully.

We encourage developers that use AI to contribute to FTAC. The codebase is small, but the JSON it produces is consumed by Fabric and Terraform, and a subtle change to key order, quoting, or expression rewriting can break a deployment that looked fine in review. We're very glad that new contributors are able to engage with the codebase through AI where they would not have been able to before. However, just like before AI, the same concepts apply:

1. Don't be lazy. We have to read your code.
2. Don't be lazy. We have to read your code in the future.
3. Don't be lazy. We have to understand your code.
4. Don't be lazy. We have to understand your code in the future.
5. Don't be lazy. Noise drowns progress.

Your AI-generated code should be indistinguishable from code written by a human. If it isn't, there's a high-likelihood that we will respectfully close your issue/pull request. We want to help you, however, we also want you to help you.

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the main branch:

    ```shell
    git checkout main -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your main with the latest upstream version:

    ```shell
    git pull --ff upstream main
    ```

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs (unit-tests). A spec sits beside its module as `<name>.test.ts` and needs no Fabric workspace or database.
* One function per file, and `index.ts` re-exports everything public.
* All public API methods **must be documented** with a doc comment, and every built-in action **must have an example** in its module; the actions reference on the docs site is generated from them.
* The generated JSON follows the Fabric portal's key order so a generated pipeline diffs cleanly against a captured one. A change that reorders keys is a bug unless the portal changed.
* The JSON is the contract. A change that alters the output of an existing example commits the regenerated JSON in the same PR, and the PR description says why the output changed.

## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Samples: (even more [samples](https://github.com/graycoreio/ftac/commits/main))

```
docs(actions): describe the copy sink options
```
```
fix(yaml): quote a sql() literal that contains a newline

Postgres read the unescaped newline as the end of the statement, so a
multi-line vars value failed at run time while the lint passed.
```

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: nx, npm)
* **ci**: Changes to our CI configuration files and scripts (example scopes: actions, dependabot)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests

### Scope
The scope should be the name of the layer affected, as perceived by the person reading the changelog generated from commit messages.

The following is the list of supported scopes:

- `expr`, `sql`, `stores`, `activities`, `pipeline`, `cli`, `executor`: the [library layers](./lib/ftac/README.md#layers)
- `yaml`: the `*-pipeline.yaml` compiler
- `actions`: the built-in `fabric/<name>` actions and their generated reference pages
- `examples`: the reference pipelines under `examples/`

In the event that a changeset impacts many layers (i.e. a dependency upgrade), please forego use a scope at all i.e.

```
build: upgrade vitest to version 5
```


### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

A detailed explanation can be found in this [document][commit-message-format].


[coc]: ./CODE_OF_CONDUCT.md
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
[dev-doc]: ./docs/developer/README.md
[github]: https://github.com/graycoreio/ftac
[discussions]: https://github.com/graycoreio/ftac/discussions
[discord]: https://discord.com/invite/BdaJVZ53sR
[hello]: ./examples/hello/hello-pipeline.yaml
