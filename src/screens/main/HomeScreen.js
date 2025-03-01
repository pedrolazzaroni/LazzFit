import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  // Cards para a tela inicial
  const workoutCards = [
    { 
      id: 1, 
      title: 'Treino de Força', 
      duration: '45 min', 
      level: 'Intermediário',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 2, 
      title: 'Cardio Intenso', 
      duration: '30 min', 
      level: 'Avançado',
      image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 3, 
      title: 'Yoga Relaxante', 
      duration: '60 min', 
      level: 'Iniciante',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'
    },
  ];

  const nutritionTips = [
    { 
      id: 1, 
      title: 'Proteínas para Ganho Muscular', 
      description: 'Aprenda como balancear sua alimentação...',
    },
    { 
      id: 2, 
      title: 'Carboidratos de Qualidade', 
      description: 'Conheça os melhores carboidratos para energia...',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Saudação ao usuário */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Bem-vindo, {user?.email?.split('@')[0] || 'Usuário'}!
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Destaque do dia */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightContent}>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightTitle}>Treino de Hoje</Text>
              <Text style={styles.highlightDescription}>
                Full Body Workout - 40min
              </Text>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Começar</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.highlightImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=400&auto=format&fit=crop' }}
                style={styles.highlightImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Seção de Treinos */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Treinos Recomendados</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {workoutCards.map((card) => (
              <TouchableOpacity key={card.id} style={styles.workoutCard}>
                <Image
                  source={{ uri: card.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <View style={styles.cardDetails}>
                    <View style={styles.cardDetail}>
                      <Ionicons name="time-outline" size={14} color={Colors.white} />
                      <Text style={styles.cardDetailText}>{card.duration}</Text>
                    </View>
                    <View style={styles.cardDetail}>
                      <Ionicons name="fitness-outline" size={14} color={Colors.white} />
                      <Text style={styles.cardDetailText}>{card.level}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Seção de Nutrição */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dicas de Nutrição</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {nutritionTips.map((tip) => (
            <TouchableOpacity key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="restaurant-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey500} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.grey100,
  },
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: 15,
  },
  welcomeContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  welcomeContent: {
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  dateText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 5,
  },
  highlightCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 15,
  },
  highlightContent: {
    flexDirection: 'row',
  },
  highlightTextContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 5,
  },
  highlightDescription: {
    fontSize: 14,
    color: Colors.grey700,
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginRight: 5,
  },
  highlightImageContainer: {
    flex: 1,
  },
  highlightImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  cardsContainer: {
    paddingRight: 20,
  },
  workoutCard: {
    width: SCREEN_WIDTH * 0.65,
    height: 150,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  cardDetails: {
    flexDirection: 'row',
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetailText: {
    color: Colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 3,
  },
  tipDescription: {
    fontSize: 13,
    color: Colors.grey600,
  },
  bottomSpace: {
    height: 30,
  },
});
