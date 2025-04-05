import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS } from '@/constants/theme'

const index = () => {

  const [firstMatch, setFirstMatch] = React.useState(false)

  return (
    <View style={styles.container}>
      <View>
        {
          firstMatch ? (
            <Text>First match</Text>
          ) : (
            <Text>Not first match</Text>
          )
        }
        <Text style={styles.findMatch}></Text>
        <Text>Play a 1v1 match</Text>
        <TouchableOpacity>
          <Text>Find match</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.background,
      // color: COLORS.white, // color prop is not valid on View
    },
    findMatch: {
      fontSize: 30,
      fontWeight: "bold",
      color: COLORS.white,
      marginBottom: 10,
    },
})