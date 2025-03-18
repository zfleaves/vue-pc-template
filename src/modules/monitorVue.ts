import { MonitorVue, init } from 'zfleaves-monitor-web/dist/index';
import { type UserModule } from '@/types'

export const install: UserModule = ({ app, isClient }) => {
    const dsn = import.meta.env.VITE_API_URL;
    console.log('dsn: ', dsn);
    // @ts-ignore
    app.use(MonitorVue);
    if (isClient) {
        init({
            debug: true,
            silentConsole: true,
            maxBreadcrumbs: 10,
            dsn: `${dsn}/upload`,
            // 如果需要自定义上报，则需要实现 beforeDataReport 方法，且返回 false，
            // beforeDataReport: (data) => {
            //     console.log('data: ', data);
            //     return false;
            // }
        });
    }
}