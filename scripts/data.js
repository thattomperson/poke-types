const { writeFile } = require('fs/promises');

require('next/dist/server/node-polyfill-fetch')

const languagesQuery = `
query Languages($_nin: [Int!] = [11, 2]) {
  languages: pokemon_v2_language(where: {official: {_eq: true}, _and: {id: {_nin: $_nin}}}) {
    id
    iso639
    name
    pokemon_v2_typenames {
      id
      name
      pokemon_v2_type {
        id
        name
        generation_id
        pokemon_v2_typeefficacies {
          target_type_id
          id
          damage_factor
          damage_type_id
        }
      }
    }
  }
}
`

async function main() {
  const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
    method: 'POST',
    body: JSON.stringify({
      query: languagesQuery
    }),
  })

  const { data: { languages } } = await response.json();

  console.log(languages)

  await writeFile('./data/languages.json', JSON.stringify(languages.map(language => language.name), null, 2))

  for (let index = 0; index < languages.length; index++) {
    const language = languages[index];

    await writeFile(`./data/data.${language.name}.json`, JSON.stringify(language.pokemon_v2_typenames, null, 2))
  }
}

main()