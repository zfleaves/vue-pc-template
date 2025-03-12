<template>
  <div text-center>
    <div mb-10>我是测试页面</div>
    <p>
      {{ t('intro.hi', { name: route.query.name }) }}
    </p>
    <p text-sm opacity-75>
      <em>{{ t('intro.dynamic-route') }}</em>
    </p>
    <template v-if="user.otherNames.length">
      <p mt-4 text-sm>
        <span opacity-75>{{ t('intro.aka') }}:</span>
        <ul>
          <li v-for="otherName in user.otherNames" :key="otherName">
            <RouterLink :to="`/about?name=${encodeURIComponent(otherName)}`" replace>
              {{ otherName }}
            </RouterLink>
          </li>
        </ul>
      </p>
    </template>

    <div>
      <button
        m="3 t6" text-sm btn
        @click="router.back()"
      >
        {{ t('button.back') }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'AboutPage',
});

const props = defineProps<{  }>()
const router = useRouter()
const route = useRoute()
const user = useUserStore()

const { t } = useI18n()
watchEffect(() => {
  user.setNewName(route.query.name as string)
})

</script>
