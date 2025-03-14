<template>
  <div text-center>
    <div mb-10 class="title-text">我是首页</div>
    <div py-4>
      <em text-sm opacity-75>{{ t("intro.desc") }}</em>
    </div>
    <input
    id="input"
      v-model="name"
      type="text"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
    >
    <div>
      <button m-3 text-sm btn @click="go">
        {{ t("button.go") }}
      </button>
    </div>
    <nav flex="~ gap-4" mt-6 justify-center text-xl>
      <button icon-btn :title="t('button.toggle_dark')" @click="toggleDark()">
        <div i="carbon-sun dark:carbon-moon" />
      </button>
      <a icon-btn :title="t('button.toggle_langs')" @click="toggleLocales()">
        <div i-carbon-language />
      </a>
    </nav>
    <nav flex="~ gap-4" mt-6 justify-center text-xl>
      <!-- <button m-3 text-sm btn @click="handleLoginTest">
        登录测试
      </button> -->
      <el-button type="primary" @click="handleLoginTest">登录测试</el-button primary>
    </nav>
    <el-card style="max-width: 480px">
      <template #header>
        <div class="card-header">
          <span>Card name</span>
        </div>
      </template>
      <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
      <template #footer>Footer content</template>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { availableLocales, loadLanguageAsync } from '@/modules/i18n';
import { getAuthorButtons } from '@/api/login';

defineOptions({
  name: "HomePage",
});
const user = useUserStore();
const name = ref(user.savedName);

const router = useRouter();

const { t, locale } = useI18n();
const go = () => {
  if (name.value) router.push(`/about?name=${encodeURIComponent(name.value)}`);
};
const toggleLocales = async () => {
  const locales = availableLocales;
  const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length];
  await loadLanguageAsync(newLocale);
  locale.value = newLocale;
};
const handleLoginTest = async () => {
  const res = await getAuthorButtons({time: Date.now()});
  console.log('res: ', res);
}
</script>
<style lang="scss" scoped>
.title-text {
  color: $red;
}
</style>
