import { Box, Typography, Stack, Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSources } from './adapters/sources';

export function Source() {
  const params = useParams();
  const { isLoading, isError, data: sources } = useSources();

  console.log(params);
  const sourceName = params['name'];
  return (
    <Box
      sx={{
        display: 'flex',
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
        padding: 1,
      }}
    >
      <Stack sx={{ width: '100%', height: '100%', paddingInline: 1 }}>
        <Stack direction="row" sx={{ paddingTop: 1 }}>
          <Box sx={{ height: '50px', width: '100%' }}>
            <Skeleton width="100%" height="100%" sx={{ transform: 'none' }} />
          </Box>
        </Stack>
        <Stack
          direction="row"
          sx={{
            marginTop: 1,
            width: '100%',
            border: '1px #efefef solid',
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
            {isLoading || isError || !sourceName
              ? '<Loading...>'
              : JSON.stringify(sources[sourceName]?.models, null, 2)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
