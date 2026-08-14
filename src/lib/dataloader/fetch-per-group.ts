export async function fetchPerGroup<Key, Value, GroupKey extends PropertyKey>(
  keys: readonly Key[],
  toGroupKey: (key: Key) => GroupKey,
  fetchGroup: (keys: readonly Key[]) => Promise<readonly Value[]>,
): Promise<Value[]> {
  const groups = Map.groupBy(keys, toGroupKey);

  const valuesByKey = new Map<Key, Value>();
  await Promise.all(
    [...groups].map(async ([_, group]) => {
      const values = await fetchGroup(group);
      group.forEach((key, i) => valuesByKey.set(key, values[i]!));
    }),
  );

  return keys.map((key) => valuesByKey.get(key)!);
}
