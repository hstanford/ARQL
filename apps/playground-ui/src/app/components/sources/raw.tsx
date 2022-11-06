import { DataType } from '@arql/models';
import { Box, Typography } from '@mui/material';

export function RawModels({
  source,
}: {
  source: {
    models: { name: string; fields: { name: string; datatype: DataType }[] };
  };
}) {
  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'auto',
      }}
    >
      <Typography
        fontFamily='"Fira code", "Fira Mono", monospace'
        sx={{
          whiteSpace: 'pre-wrap',
          margin: 1,
        }}
      >
        {JSON.stringify(source.models, null, 2)}
      </Typography>
    </Box>
  );
}
