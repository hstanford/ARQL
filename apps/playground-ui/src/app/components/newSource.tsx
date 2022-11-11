import {
  Box,
  Button,
  Modal,
  Paper,
  Stack,
  SxProps,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import Editor from 'react-simple-code-editor';
import {
  useAddLocalSource,
  useAddMongoSource,
  useAddPgSource,
} from '../adapters/sources';
import { SourceIcon } from '../icon';

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline'
  | 'inherit'
  | undefined;

export function Txt({
  sx,
  text,
  variant,
}: {
  sx?: SxProps;
  text: string;
  variant?: Variant;
}) {
  return (
    <Typography
      fontFamily='"Fira code", "Fira Mono", monospace'
      variant={variant}
      sx={sx || {}}
    >
      {text}
    </Typography>
  );
}

type SourceType = 'local' | 'postgres' | 'mongo';

export function NewSourceModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<SourceType>('local');
  const [config, setConfig] = useState<Record<string, unknown>>({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  });
  const updateConfig = useCallback(
    (key: string, value: unknown) => setConfig({ ...config, [key]: value }),
    [config, setConfig]
  );

  const [mongoConfig, setMongoConfig] = useState<{
    connectionUri: string;
    db: string;
  }>({
    connectionUri: 'mongodb://root:example@localhost:27017/',
    db: 'test',
  });
  const updateMongoConfig = useCallback(
    (key: string, value: unknown) =>
      setMongoConfig({ ...mongoConfig, [key]: value }),
    [mongoConfig, setMongoConfig]
  );

  const [data, setData] = useState(
    `{
  "users": [
    {"name": "jack", "alias": "j"},
    {"name": "alan", "alias": "a"},
    {"name": "Joe", "alias": "JJ"}
  ]
}`
  );

  const pgMutation = useAddPgSource();
  const mongoMutation = useAddMongoSource();
  const localMutation = useAddLocalSource();

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{ height: '100%', display: 'flex' }}
    >
      <Box sx={{ width: '500px', margin: 'auto' }}>
        <Paper>
          <Box sx={{ padding: 2, overflow: 'hidden' }}>
            <Stack spacing={1}>
              <Txt text={'Add source'} variant="h5" />
              <TextField
                variant="outlined"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(e, value) => {
                  setType(value);
                }}
                aria-label="text alignment"
                sx={{ overflow: 'auto' }}
              >
                <ToggleButton value="local">
                  <Box sx={{ marginBlock: 'auto', marginInline: 2 }}>
                    <SourceIcon sourceType="local" />
                  </Box>
                  Local {'(JS)'}
                </ToggleButton>
                <ToggleButton value="postgres">
                  <Box sx={{ marginBlock: 'auto', marginInline: 2 }}>
                    <SourceIcon sourceType="PostgreSQL" />
                  </Box>
                  PostgreSQL
                </ToggleButton>
                <ToggleButton value="mongo">
                  <Box sx={{ marginBlock: 'auto', marginInline: 2 }}>
                    <SourceIcon sourceType="MongoDb" />
                  </Box>
                  MongoDB
                </ToggleButton>
              </ToggleButtonGroup>
              {type === 'postgres' ? (
                <PostgresConfig config={config} setConfig={updateConfig} />
              ) : type === 'mongo' ? (
                <MongoConfig
                  config={mongoConfig}
                  setConfig={updateMongoConfig}
                />
              ) : (
                <LocalConfig data={data} setData={setData} />
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  if (type === 'postgres') {
                    pgMutation.mutate({ name, connectionVariables: config });
                  } else if (type === 'mongo') {
                    mongoMutation.mutate({
                      name,
                      ...mongoConfig,
                    });
                  } else {
                    localMutation.mutate({ name, data: JSON.parse(data) });
                  }
                  setOpen(false);
                }}
              >
                Add source
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}

export function PostgresConfig({
  setConfig,
  config,
}: {
  setConfig: (key: string, value: unknown) => void;
  config: Record<string, unknown>;
}) {
  return (
    <Stack spacing={1}>
      <TextField
        variant="outlined"
        label="User"
        value={config['user']}
        onChange={(e) => setConfig('user', e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Host"
        value={config['host']}
        onChange={(e) => setConfig('host', e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Database"
        value={config['database']}
        onChange={(e) => setConfig('database', e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Password"
        value={config['password']}
        onChange={(e) => setConfig('password', e.target.value)}
      />
      <TextField
        type="number"
        variant="outlined"
        label="Port"
        value={config['port']}
        onChange={(e) => setConfig('port', e.target.value)}
      />
    </Stack>
  );
}

export function MongoConfig({
  setConfig,
  config,
}: {
  setConfig: (key: string, value: unknown) => void;
  config: {
    connectionUri: string;
    db: string;
  };
}) {
  return (
    <Stack spacing={1}>
      <TextField
        variant="outlined"
        label="Connection URI"
        value={config['connectionUri']}
        onChange={(e) => setConfig('connectionUri', e.target.value)}
      />
      <TextField
        variant="outlined"
        label="Database Name"
        value={config['db']}
        onChange={(e) => setConfig('db', e.target.value)}
      />
    </Stack>
  );
}

export function LocalConfig({
  data,
  setData,
}: {
  data: string;
  setData: (val: string) => void;
}) {
  return (
    <Box>
      <Txt text="Data" />
      <Editor
        value={data}
        onValueChange={(code) => setData(code)}
        highlight={(code) => code}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 16,
          height: '100%',
          minHeight: '200px',
          border: '1px grey solid',
        }}
      />
    </Box>
  );
}
