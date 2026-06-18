# PostHog post-wizard report

The wizard has completed a PostHog integration for this Retool custom component library. Two new files were created — `src/posthog.ts` (a shared PostHog client singleton) and the existing `src/PivotTable.tsx` was updated to capture events when users interact with the pivot table. Environment variables are stored in `.env` and referenced via `process.env`.

| Event name | Description | File |
|---|---|---|
| `pivot_table_configuration_changed` | Fired when the user changes the pivot table layout, such as dragging fields to rows/columns or changing the aggregator. | `src/PivotTable.tsx` |
| `pivot_table_data_loaded` | Fired when the pivot table receives new data from the Retool data source. | `src/PivotTable.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/465976/dashboard/1728573)
- [Pivot table configuration changes over time](https://us.posthog.com/project/465976/insights/A8xIrapM)
- [Pivot table data loads over time](https://us.posthog.com/project/465976/insights/cfWT3UPJ)
- [Unique users interacting with pivot table](https://us.posthog.com/project/465976/insights/mPQm1214)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_API_KEY` and `POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
