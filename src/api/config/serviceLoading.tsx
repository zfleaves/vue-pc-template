import { ElLoading } from "element-plus";

let needLoadingRequestCount = 0;
let loading: any;

// * 显示loading
export const showFullScreenLoading = (text = "Loading") => {
  if (needLoadingRequestCount === 0) {
    loading = ElLoading.service({
      lock: true,
      text: text,
      background: "rgba(0, 0, 0, 0.7)",
    });
  }
  needLoadingRequestCount++;
};

// * 隐藏loading
export const tryHideFullScreenLoading = () => {
	if (needLoadingRequestCount <= 0) return;
	needLoadingRequestCount--;
	if (needLoadingRequestCount === 0) {
		loading.close();
	}
};
