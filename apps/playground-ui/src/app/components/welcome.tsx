import { Box, Typography } from '@mui/material';

export function Welcome() {
  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h3" fontFamily='"Fira code", "Fira Mono", monospace'>
        Welcome to the ARQL playground!
      </Typography>
      <br />
      <Typography fontFamily='"Fira code", "Fira Mono", monospace'>
        Configure and inspect your data sources under "Sources" in the sidebar,
        and run ARQL queries in the "Queries" tab!
      </Typography>
    </Box>
  );
}
