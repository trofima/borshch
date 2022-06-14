export default class ExtendedMap extends Map {
  getOrSet(key, defaultVal) {
    return this.get(key) || this.set(key, defaultVal).get(key);
  }

  getIndex(key) {
    const keys = this.keys();

    for (let i = 0; i < this.size; i++)
      if (key === keys.next().value)
        return i;
  }
}

// class ExtendedMap extends Map {
//   getOrDefault(key, getDefaultVal) {
//     return this.get(key) || this.set(key, getDefaultVal()).get(key)
//   }

//   getIndex(key) {
//     const keys = this.keys()

//     for (let i = 0; i < this.size; i++) if (key === keys.next().value) return i
//   }

//   moveToEnd(key) {
//     if (this.has(key)) {
//       const value = this.get(key)

//       this.delete(key)
//       this.set(key, value)
//     }

//     return this
//   }

//   sort(comparator) {
//     const sortedEntries = [...this.entries()].sort(comparator)

//     this.clear()
//     sortedEntries.forEach(([key, value]) => this.set(key, value))

//     return this
//   }

//   toArray(mapper) {
//     return Array.from(this, mapper)
//   }
// }
