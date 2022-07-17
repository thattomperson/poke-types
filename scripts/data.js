const { writeFile } = require('fs/promises');

require('next/dist/server/node-polyfill-fetch')

const languagesQuery = `
query Languages($language_ids: [Int!] = [11, 2, 4], $type_ids: [Int!] = [10001, 10002]) {
  languages: pokemon_v2_language(where: {official: {_eq: true}, _and: {id: {_nin: $language_ids}}}) {
    id
    iso639
    name
    pokemon_v2_typenames(where: {pokemon_v2_type: {id: {_nin: $type_ids}}}) {
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

  await writeFile('./data/languages.json', JSON.stringify(languages.map(language => language.iso639), null, 2))

  for (let index = 0; index < languages.length; index++) {
    const language = languages[index];
    const out = {
      types: language.pokemon_v2_typenames.reduce((acc, name) => {
        acc[name.pokemon_v2_type.id] = {
          id: name.pokemon_v2_type.id,
          name: name.name
        }

        return acc;
      }, {}),
      efficacies: language.pokemon_v2_typenames.reduce((acc, name) => {
        acc[name.pokemon_v2_type.id] = {
          id: name.pokemon_v2_type.id,
          damage: name.pokemon_v2_type.pokemon_v2_typeefficacies.reduce((acc, e) => {
            acc[e.target_type_id] = e.damage_factor / 100;

            return acc;
          }, {})
        }
        return acc;
      }, {})
    }

    await writeFile(`./data/data.${language.iso639}.json`, JSON.stringify(out, null, 2))
  }
}

main()