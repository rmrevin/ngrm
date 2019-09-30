# Подготовка локального окружения
```bash
yarn global add @angular-devkit/schematics-cli
```
# Локальный запуск
```bash
// этот вариант запустится в режиме dry-run
yarn r .:<schematic-name> <options> 
```

```bash
// если хотите увидеть результат генерации, необходимо добавить ключ --dry-run=false
yarn r .:<schematic-name> --dry-run=false <options> 
```

# Публикация пакета
```bash
yarn publish
```
