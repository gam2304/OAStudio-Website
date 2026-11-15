
package com.oastudio.api.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JwtConfig {

    @Bean
    public RSAPrivateKey jwtPrivateKey(
            @Value("${app.security.jwt.private-key}") Resource resource)
            throws IOException, GeneralSecurityException {

        String pem = new String(resource.getInputStream().readAllBytes());

        String content = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(content);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);

        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(keySpec);
    }

    @Bean
    public RSAPublicKey jwtPublicKey(
            @Value("${app.security.jwt.public-key}") Resource resource)
            throws IOException, GeneralSecurityException {

        String pem = new String(resource.getInputStream().readAllBytes());

        String content = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(content);

        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);

        return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(keySpec);
    }

    @Bean
    public JwtEncoder jwtEncoder(
            RSAPublicKey publicKey,
            RSAPrivateKey privateKey) {

        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .build();

        JWKSource<SecurityContext> jwkSource =
                new ImmutableJWKSet<>(new JWKSet(rsaKey));

        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {

        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }
}
