const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  'src/screens/ProviderDetailsScreen.tsx',
  'src/screens/SearchScreen.tsx',
  'src/screens/WriteReviewScreen.tsx',
  'src/screens/ProfileScreen.tsx',
  'src/screens/RegisterScreen.tsx',
  'src/screens/LoginScreen.tsx',
  'src/screens/JobsScreen.tsx',
  'src/screens/JobDetailsScreen.tsx',
  'src/screens/EditProfileScreen.tsx',
  'src/screens/CreateServiceRequestScreen.tsx',
  'src/components/JobCard.tsx',
  'src/components/StarRating.tsx',
  'src/components/ServiceProviderCard.tsx',
];

// Update each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace the import
    content = content.replace(
      /import \{ (Ionicons|MaterialIcons|FontAwesome|Feather|MaterialCommunityIcons|AntDesign|Entypo|FontAwesome5|Ionicons) \} from ["']@expo\/vector-icons["']/g,
      'import $1 from "react-native-vector-icons/$1"'
    );
    
    // Replace any remaining @expo/vector-icons imports
    content = content.replace(
      /import .* from ["']@expo\/vector-icons.*/g,
      'import Icon from "react-native-vector-icons/Ionicons"'
    );
    
    // Save the file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

console.log('Icon imports updated successfully!');
