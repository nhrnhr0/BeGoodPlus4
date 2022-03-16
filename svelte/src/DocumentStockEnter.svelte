

<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import { apiSearchProviders } from "./api/api";
    import { Grid, Row, Column,Theme, RadioButton, Form , FormGroup, Checkbox, RadioButtonGroup, Select, SelectItem, Button} from "carbon-components-svelte";
    let theme = "white";
    export let id = undefined;
    let providerValue;
    function searchProviders(keyword) {
        let json = apiSearchProviders(keyword);
        let data = json;
        
        console.log(data);
        return data;
    }
</script>

<div class="document-stock-entery">
    <Theme bind:theme persist persistKey="__carbon-theme" />
    <RadioButtonGroup legendText="Carbon theme" bind:selected={theme}>
    {#each ["white", "g10", "g80", "g90", "g100"] as value}
        <RadioButton labelText={value} {value} />
    {/each}
    </RadioButtonGroup>
    <Form class="product-entery-form">
        <FormGroup legendText="שלב א - מאיפה לאן">
            <Grid>
                <Row>
                    
                    <Column>
                        <AutoComplete
                            label="חפש ספק"
                            placeholder="חפש ספק"
                            searchFunction={searchProviders} 
                            delay=200 localFiltering="{false}" 
                            labelFieldName="name" valueFieldName="id"
                            bind:value={providerValue}
                        />
                    </Column>
                </Row>
            </Grid>
        </FormGroup>
    </Form>
</div>

<div class="border-blue clr-red">
    hey
    <div class="border-blue">hey2
    
    </div>
</div>


<style lang="scss">


    :global(.product-entery-form) {
        max-width: 90%;;
        margin: auto;
        margin-top: 200px;
        padding: 30px;
        border: 1px solid black;
    }
</style>