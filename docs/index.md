---
layout: home

hero:
  name: FTAC
  text: Fabric pipelines, written like GitHub Actions.
  tagline: Compile Microsoft Fabric pipeline definitions from YAML. You edit a *-pipeline.yaml. FTAC generates the pipeline-content.json so you never have to.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Built-in actions
      link: /reference/actions/
    - theme: alt
      text: GitHub
      link: https://github.com/graycoreio/ftac

features:
  - title: SQL stays SQL
    details: Queries live in the YAML, or in .sql files beside it, instead of inside JSON string literals. A ${{ sql(expr) }} inside a query becomes an escaped, quoted literal.
  - title: Expressions you can read
    details: Write ${{ }} with inputs, vars, env and steps.x.outputs. FTAC rewrites them to the ADF expressions Fabric expects.
  - title: A graph, not a dependsOn
    details: The activity graph is a list of steps with needs. The lint catches duplicate names, cross-scope dependencies and undeclared variables before Fabric does.
  - title: Diffs that review well
    details: The generated JSON follows the key order the Fabric portal exports, so it diffs cleanly against a captured pipeline and against the last commit.
---
