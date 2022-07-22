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

const typeColors = {
  1: {
    background: "#A8A878",
    border: "#6D6D4E",
  },
  2: {
    background: "#C03028",
    border: "#7D1F1A",
  },
  3:{
    background: "#A890F0",
    border: "#6D5E9C",
  },
  4: {
    background: "#A040A0",
    border: "#682A68",
  },
  5:{
    background: "#E0C068",
    border: "#927D44",
  },
  6:{
    background: "#B8A038",
    border: "#786824",
  },
  7: {
    background: '#A8B820',
    border: '#6D7815',
  },
  8:{
    background: "#705898",
    border: "#493963",
  },
  9: {
    background: "#B8B8D0",
    border: "#787887",
  },
  10: {
    background: "#F08030",
    border: "#9C531F",
  },
  11: {
    background: "#6890F0",
    border: "#445E9C",
  },
  12: {
    background: "#78C850",
    border: "#4E8234",
  },
  13: {
    background: "#F8D030",
    border: "#A1871F",
  },
  14: {
    background: "#F85888",
    border: "#A13959",
  },
  15: {
    background: "#98D8D8",
    border: "#638D8D",
  },
  16: {
    background: "#7038F8",
    border: "#4924A1",
  },
  17: {
    background: "#705848",
    border: "#49392F",
  },
  18: {
    background: "#EE99AC",
    border: "#9B6470",
  },
}

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
          name: name.name,
          primaryColor: typeColors[name.pokemon_v2_type.id].background,
          secondaryColor: typeColors[name.pokemon_v2_type.id].border,
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