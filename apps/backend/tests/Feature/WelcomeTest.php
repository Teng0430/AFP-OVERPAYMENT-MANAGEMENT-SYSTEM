<?php

test('default welcome page returns HTTP 200', function (): void {
    $response = $this->get('/');

    $response->assertStatus(200);
});
