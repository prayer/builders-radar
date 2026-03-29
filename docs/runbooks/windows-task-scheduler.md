# Windows Task Scheduler

Create a scheduled task that runs the same entrypoint used for manual execution.

## Command

```powershell
npm run daily -- --date YYYY-MM-DD --publish
```

## Notes

- Replace `YYYY-MM-DD` with a wrapper strategy before production scheduling.
- Keep scheduled execution aligned with the upstream feed refresh window.
- Use the same project directory as the interactive runs.
