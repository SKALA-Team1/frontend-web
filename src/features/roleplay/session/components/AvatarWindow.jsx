import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Box, IconButton, CircularProgress } from '@mui/material'
import { Fullscreen, FullscreenExit } from '@mui/icons-material'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations, Environment, PresentationControls } from '@react-three/drei'

const DEFAULT_AVATAR_URL = 'https://models.readyplayer.me/6923c7a27b7a88e1f6a5ed6a.glb'

// 아바타 모델 컴포넌트
function AvatarModel({ url, onLoad, onError, isTTSPlaying = false }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions, mixer } = useAnimations(animations, groupRef)
  const mouthTargetsRef = useRef([]) // 입 morph target 참조
  
  // 아바타 위치 설정 (x: 좌우, y: 상하, z: 앞뒤)
  // 이 값들을 변경하여 아바타 위치를 조정하세요
  const AVATAR_X = 0      // 좌우: 음수=왼쪽, 양수=오른쪽
  const AVATAR_Y = -11.7      // 상하: 음수=아래, 양수=위
  const AVATAR_Z = 0       // 앞뒤: 음수=뒤, 양수=앞
  
  // 자동 회전 애니메이션 및 입 모양 애니메이션
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = AVATAR_X
      groupRef.current.position.y = AVATAR_Y
      groupRef.current.position.z = AVATAR_Z
      
      // 매우 느린 자동 회전 (선택사항)
      // groupRef.current.rotation.y += delta * 0.1
    }
    
    // TTS 재생 중 입 모양 애니메이션 (빠르고 크게)
    if (isTTSPlaying && mouthTargetsRef.current.length > 0) {
      // 빠른 속도로 입 벌리기 (sin 파형 사용, 빠르게)
      const speed = 8 // 빠른 속도
      const mouthValue = Math.abs(Math.sin(state.clock.elapsedTime * speed)) * 0.9 + 0.1 // 0.1 ~ 1.0
      
      mouthTargetsRef.current.forEach(({ mesh, index }) => {
        if (mesh.morphTargetInfluences && mesh.morphTargetInfluences[index] !== undefined) {
          mesh.morphTargetInfluences[index] = mouthValue
        }
      })
    } else {
      // TTS 재생 중지 시 입 닫기
      mouthTargetsRef.current.forEach(({ mesh, index }) => {
        if (mesh.morphTargetInfluences && mesh.morphTargetInfluences[index] !== undefined) {
          mesh.morphTargetInfluences[index] = 0
        }
      })
    }
    
    // 애니메이션 믹서 업데이트
    if (mixer) {
      mixer.update(delta)
    }
  })
  
  useEffect(() => {
    if (scene && onLoad) {
      // 아바타 크기 및 위치 조정
      const mouthTargets = []
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // 입 morph target 찾기
          if (child.morphTargetDictionary) {
            Object.keys(child.morphTargetDictionary).forEach(targetName => {
              const targetLower = targetName.toLowerCase()
              if (targetLower.includes('mouthopen') || targetLower.includes('mouth_open') || 
                  targetLower.includes('jawopen') || targetLower.includes('jaw_open')) {
                const index = child.morphTargetDictionary[targetName]
                mouthTargets.push({ mesh: child, index })
              }
            })
          }
        }
      })
      
      mouthTargetsRef.current = mouthTargets
      
      // 아바타 크기 조정 (더 크게 보이도록)
      scene.scale.set(7, 7, 7)
      scene.position.set(0, 0, 0)
      
      // GLB 파일에 포함된 애니메이션이 있으면 재생
      if (actions && Object.keys(actions).length > 0) {
        // 'idle', 'Idle', 'TPose' 등의 애니메이션 이름을 찾아서 재생
        const idleAction = actions['idle'] || actions['Idle'] || actions['TPose'] || Object.values(actions)[0]
        if (idleAction) {
          idleAction.reset().fadeIn(0.5).play()
        }
      }
      
      // 약간의 지연 후 로드 완료 알림 (렌더링 완료 보장)
      setTimeout(() => {
        onLoad()
      }, 100)
    }
    
    // 클린업: 애니메이션 정지
    return () => {
      if (actions) {
        Object.values(actions).forEach(action => {
          action?.fadeOut(0.5)
          setTimeout(() => action?.stop(), 500)
        })
      }
    }
  }, [scene, onLoad, actions, mixer])

  if (!scene) {
    return null
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// Three.js Canvas 래퍼
function AvatarCanvas({ avatarUrl, onLoad, onError, isTTSPlaying }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 50 }}
      shadows
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 조명 설정 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* 환경 설정 */}
      <Environment preset="sunset" />

      {/* 아바타 모델 */}
      <Suspense fallback={null}>
        <AvatarModel 
          url={avatarUrl || DEFAULT_AVATAR_URL} 
          onLoad={onLoad}
          onError={onError}
          isTTSPlaying={isTTSPlaying}
        />
      </Suspense>

      {/* 카메라 컨트롤 (드래그로 회전 가능) */}
      <PresentationControls
        global
        zoom={0.8}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </PresentationControls>
    </Canvas>
  )
}

export default function AvatarWindow({ avatarUrl, aiRoleName = 'AI', isTTSPlaying = false, onAvatarLoad }) {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleAvatarLoad = () => {
    setIsLoading(false)
    setLoadError(null)
    // 부모 컴포넌트에 아바타 로드 완료 알림
    if (onAvatarLoad) {
      onAvatarLoad()
    }
  }

  const handleAvatarError = (error) => {
    setLoadError(error)
    setIsLoading(false)
    // 에러 발생 시에도 아바타 로드 완료로 처리 (첫 질문 표시를 위해)
    if (onAvatarLoad) {
      onAvatarLoad()
    }
  }

  // 타임아웃 설정 (15초 후에도 로드되지 않으면 에러 처리)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        setLoadError(new Error('로드 타임아웃'))
        // 타임아웃 시에도 아바타 로드 완료로 처리 (첫 질문 표시를 위해)
        if (onAvatarLoad) {
          onAvatarLoad()
        }
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [isLoading, avatarUrl, onAvatarLoad])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.() || 
      containerRef.current.webkitRequestFullscreen?.() ||
      containerRef.current.mozRequestFullScreen?.()
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.mozCancelFullScreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    }
  }, [])


  return (
    <Box sx={{ width: '100%', mb: 2, px: 1 }}>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.23)',
          backgroundColor: 'rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isLoading && (
          <CircularProgress 
            size={48} 
            sx={{ 
              color: 'rgba(124,108,255,0.8)',
              position: 'absolute',
              zIndex: 1
            }} 
          />
        )}

        {/* Three.js 아바타 렌더링 */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'block',
            position: 'relative'
          }}
        >
          {!loadError ? (
            <AvatarCanvas 
              avatarUrl={avatarUrl || DEFAULT_AVATAR_URL} 
              onLoad={handleAvatarLoad}
              onError={handleAvatarError}
              isTTSPlaying={isTTSPlaying}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
                color: 'rgba(0,0,0,0.5)'
              }}
            >
              <Box sx={{ fontSize: '0.875rem' }}>아바타를 불러올 수 없습니다</Box>
              <Box sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                URL을 확인해주세요
              </Box>
            </Box>
          )}
        </Box>
        
        {/* 컨트롤 버튼들 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto' }}>
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#212121',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                backdropFilter: 'blur(8px)'
              }}
            >
              {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
