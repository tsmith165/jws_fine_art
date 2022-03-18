import Image from 'next/image'
import Link from 'next/link'

import PageLayout from '../src/components/layout/PageLayout'
import Button from '../src/components/Button'

import styles from '../styles/Home.module.scss'

export default function Home({snowData}) {
  var table = createTable(snowData)

  return (
    <PageLayout>
      <div className={styles.mainImage}>
        <Image 
          src="/backcountry_lines_2.jpg"
          alt="Backcountry Lines"
          layout="fill"
        />
      </div>

      <table className={styles.snowTable}>
        <tr>
          <th>Resort</th>
          <th>Current Snow Level</th>
          <th>Last Storm Total</th>
        </tr>
        {table}
      </table> 

    </PageLayout>
  )
}

export const getStaticProps = (context) => {
  var snowData = [
    ["Northstar", "50in", "2in"],
    ["Heavenly", "46in", "1in"]
  ]

  return {
    props: {"snowData": snowData},
    revalidate: 10
  }
}

function createTable(snowData) {
  var table = [];
  for (var y = 0; y < snowData.length; y++) {
    var row = <tr>
      <td>{snowData[y][0]}</td>
      <td>{snowData[y][1]}</td>
      <td>{snowData[y][2]}</td>
    </tr>
    table.push(row)
  }
  return table
}
