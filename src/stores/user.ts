import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    /**
     * Current name of the user.
     */
    const savedName = ref('')
    const previousNames = ref(new Set<string>())

    const usedNames = computed(() => Array.from(previousNames.value))
    const otherNames = computed(() => usedNames.value.filter(name => name !== savedName.value))

    /**
     * Changes the current name of the user and saves the one that was used
     * before.
     *
     * @param name - new name to set
     */
    function setNewName(name: string) {
        if (savedName.value)
            previousNames.value.add(savedName.value)

        savedName.value = name
    }

    return {
        setNewName,
        otherNames,
        savedName,
    }
})

if (import.meta.hot)
    // 检查当前环境是否支持热模块替换
    import.meta.hot.accept(
        // 调用 acceptHMRUpdate 函数来处理 useUserStore 存储的更新
        acceptHMRUpdate(useUserStore as any, import.meta.hot)
    );