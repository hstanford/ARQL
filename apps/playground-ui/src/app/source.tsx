import {
  Box,
  Typography,
  Stack,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import { useRefreshSource, useSources } from './adapters/sources';
import { useState } from 'react';
import { SourceIcon } from './icon';
import { RawModels } from './components/sources/raw';
import { PrettyModels } from './components/sources/pretty';
import { Refresh } from '@mui/icons-material';

export function Source() {
  const params = useParams();
  const { isLoading, isError, data: sources } = useSources();

  const [view, setView] = useState<'raw' | 'pretty' | 'edit'>('pretty');

  const refreshSource = useRefreshSource();

  const sourceName = params['name'];

  if (!sourceName || isLoading || isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          width: 'calc(100% - 16px)',
          height: 'calc(100% - 16px)',
          padding: 1,
          overflow: 'hidden',
        }}
      >
        Loading...
      </Box>
    );
  }

  const source = sources[sourceName];

  if (!source) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: 'calc(100% - 32px)',
        height: 'calc(100% - 32px)',
        padding: 2,
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ width: '100%', height: '100%' }}>
        <Stack direction="row" sx={{ border: '1px #efefef solid' }}>
          <Box sx={{ marginBlock: 'auto', marginInline: 2 }}>
            <SourceIcon sourceType={source.type} />
          </Box>
          <Typography
            fontFamily='"Fira code", "Fira Mono", monospace'
            sx={{ margin: 'auto' }}
          >
            {sourceName}
          </Typography>
          <IconButton onClick={() => refreshSource.mutate(sourceName)}>
            <Refresh />
          </IconButton>
          <Box sx={{ height: '50px', width: '100%', marginLeft: 2 }}>
            <Skeleton width="100%" height="100%" sx={{ transform: 'none' }} />
          </Box>
        </Stack>
        <Stack
          direction="row"
          sx={{
            marginTop: 1,
            position: 'relative',
            overflow: 'hidden',
            border: '1px #efefef solid',
            height: '100%',
          }}
        >
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, value) => {
              setView(value);
            }}
            aria-label="text alignment"
            sx={{ position: 'absolute', right: 0, margin: 1, zIndex: 1 }}
          >
            <ToggleButton value="raw">Raw</ToggleButton>
            <ToggleButton value="pretty">Pretty</ToggleButton>
            <ToggleButton value="edit">Edit</ToggleButton>
          </ToggleButtonGroup>
          {view === 'raw' ? (
            <RawModels source={source} />
          ) : view === 'pretty' ? (
            <PrettyModels source={source} />
          ) : (
            ''
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
