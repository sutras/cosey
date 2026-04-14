import { withInstall } from '../../utils';
import TableQuery from './table-query';

export * from './table-query.api';

const _TableQuery = withInstall(TableQuery);

export { _TableQuery as TableQuery };
export default _TableQuery;
