import { SvgIcon } from '@mui/material';
import { ReactComponent as JsIcon } from '../assets/javascript.svg';
import { ReactComponent as PostgresIcon } from '../assets/postgresql.svg';
import { ReactComponent as MongoIcon } from '../assets/mongo.svg';

export function SourceIcon({ sourceType }: { sourceType: string }) {
  return (
    <SvgIcon
      component={
        sourceType === 'PostgreSQL'
          ? PostgresIcon
          : sourceType === 'MongoDb'
          ? MongoIcon
          : JsIcon
      }
    />
  );
}
