import { FileListParamState } from '../redux/FileListParamSlice';
import { SortList } from '../api/enums';

export const defaultFileListParamState: FileListParamState = {
  search: '',
  page: 1,
  sort: SortList.CREATED_DESC,
  page_size: 20,
  filters: {
    status: null,
    file_type: null,
    date_from: null,
    date_to: null,
  },
};
