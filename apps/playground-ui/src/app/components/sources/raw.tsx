import { DataType } from '@arql/types';
import { Box, Typography } from '@mui/material';

export function RawModels({
  source,
}: {
  source: {
    models: { name: string; fields: { name: string; dataType: DataType }[] };
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
