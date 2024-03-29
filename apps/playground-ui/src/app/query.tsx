import { Box, Fab, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import Editor from 'react-simple-code-editor';
import { useArqlQuery } from './adapters/sources';
import { ReactComponent as ARQLIcon } from '../assets/ARQL.svg';

export function Query({
  code,
  setCode,
}: {
  code: string;
  setCode: (val: string) => void;
}) {
  const mutation = useArqlQuery();

  return (
    <Box
      sx={{
        display: 'flex',
        width: 'calc(100% - 32px)',
        height: 'calc(100% - 32px)',
        padding: 2,
      }}
    >
      <Stack sx={{ width: '100%', height: '100%' }}>
        <Stack direction="row" sx={{ border: '1px #efefef solid' }}>
          <Box sx={{ marginBlock: 'auto', marginInline: 2 }}>
            <SvgIcon component={ARQLIcon} />
          </Box>
          <Typography
            fontFamily='"Fira code", "Fira Mono", monospace'
            sx={{ margin: 'auto' }}
          >
            Queries
          </Typography>
          <Box sx={{ height: '50px', width: '100%', marginLeft: 2 }}>
            <Skeleton width="100%" height="100%" sx={{ transform: 'none' }} />
          </Box>
        </Stack>
        <Stack direction="row" sx={{ paddingTop: 1, height: '100%' }}>
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              width: '70%',
              border: '1px #efefef solid',
            }}
          >
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) => code}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                height: '100%',
              }}
            />
            <Fab
              sx={{ position: 'absolute', bottom: 0, margin: 1, right: 0 }}
              onClick={() => {
                mutation.mutate(code);
              }}
            >
              <PlayArrow />
            </Fab>
          </Box>
          <Box sx={{ width: '8px', height: '100%' }} />
          <Box
            sx={{ height: '100%', width: '30%', border: '1px #efefef solid' }}
          >
            <Typography
              fontFamily='"Fira code", "Fira Mono", monospace'
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 1,
                color:
                  mutation.data && 'error' in mutation.data ? 'red' : 'black',
              }}
            >
              {JSON.stringify(mutation.data, null, 2)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
