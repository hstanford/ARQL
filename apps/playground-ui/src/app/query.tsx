import { Box, Fab, Skeleton, Stack, Typography } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { useArqlQuery } from './adapters/sources';

export function Query() {
  const [code, setCode] =
    useState(`test | filter(foo = \${"Joe"}) | sort.desc(bar) {
  bar,
  input: \${1},
  foo
}`);
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
        <Stack direction="row">
          <Box sx={{ height: '50px', width: '100%' }}>
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
              sx={{ whiteSpace: 'pre-wrap', margin: 1 }}
            >
              {JSON.stringify(mutation.data, null, 2)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
